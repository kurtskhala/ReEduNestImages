import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { User } from './schema/user.schema';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';

@Injectable()
export class UsersService {
  constructor(
    private awsS3Service: AwsS3Service,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  findAll() {
    return this.userModel.find();
  }

  async findOneByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).select('password');

    return user;
  }

  async findOne(id) {
    if (!isValidObjectId(id))
      throw new BadGatewayException('Not valid id is provided');

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(body) {
    const existUser = await this.userModel.findOne({
      email: body.email,
    });
    if (existUser) throw new BadGatewayException('user already exists');
    const user = await this.userModel.create(body);
    return user;
  }

  async remove(id: mongoose.Schema.Types.ObjectId) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    return { message: 'user deleted', data: deletedUser };
  }

  async update(id, body) {
    if (!isValidObjectId(id))
      throw new BadGatewayException('Not valid id is provided');
    const updatedUser = await this.userModel.findByIdAndUpdate(id, body, {
      new: true,
    });
    return { message: 'user updated successfully', data: updatedUser };
  }

  async updateSubscription(
    id: string,
    subscription: 'free' | 'premium' | 'pro',
  ) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { subscription },
      { new: true },
    );
    return { message: 'subscription updated successfully', data: updatedUser };
  }

  async uploadImage(userId: string, filePath: string, file: any) {
    const user = await this.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    const uploadedFilePath = await this.awsS3Service.uploadImage(
      filePath,
      file,
    );
    user.images.push(uploadedFilePath);
    await user.save();

    return uploadedFilePath;
  }

  getImage(fileId) {
    return this.awsS3Service.getImageByFileId(fileId);
  }

  async deleteImage(userId: string, fileId: string) {
    const user = await this.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    user.images = user.images.filter((image) => image !== fileId);
    await user.save();

    return this.awsS3Service.deleteImageByFileId(fileId);
  }

  async getBillingInfo(id) {
    if (!isValidObjectId(id))
      throw new BadGatewayException('Not valid id is provided');

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.images.length * 0.5;
  }
}
