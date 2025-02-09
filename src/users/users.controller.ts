import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { IsValidMongoId } from './dto/isValidMongoId.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard } from './permissions.guard';
import { User } from './user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }

  @Get('get-billing-info')
  @UseGuards(AuthGuard)
  getBillingInfo(@User() userId) {
    return this.usersService.getBillingInfo(userId);
  }

  @Put('')
  @UseGuards(AuthGuard)
  updateUser(@User() userId, @Body() body: UpdateUserDto) {
    return this.usersService.update(userId, body);
  }

  @Put('update-subscription')
  @UseGuards(AuthGuard)
  updateSubscription(
    @User() userId,
    @Body() body: { subscription: 'free' | 'premium' | 'pro' },
  ) {
    return this.usersService.updateSubscription(userId, body.subscription);
  }

  @Delete('')
  @UseGuards(AuthGuard)
  deleteuser(@User() userId) {
    return this.usersService.remove(userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, PermissionsGuard)
  deleteOtherUser(@Param() params: IsValidMongoId) {
    return this.usersService.remove(params.id);
  }

  @Post('upload-image')
  @UseGuards(AuthGuard, PermissionsGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Multer.File, @User() userId: string) {
    const path = Math.random().toString().substring(2);
    const filePath = `images/${path}`;
    const avatarPath = file
      ? await this.usersService.uploadImage(userId, filePath, file.buffer)
      : '';
    return avatarPath;
  }


  @Get('image')
  @UseGuards(AuthGuard)
  getImage(@Body('fileId') fileId: string) {
    return this.usersService.getImage(fileId);
  }

  @Post('/deleteImage')
  @UseGuards(AuthGuard)
  deleteImage(@User() userId, @Body('fileId') fileId: string) {
    return this.usersService.deleteImage(userId, fileId);
  }
}
