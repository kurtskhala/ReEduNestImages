import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getToken(request.headers);

    if (!token) throw new UnauthorizedException();
    const payload = await this.jwtService.verify(token);

    const userData = await this.usersService.findOne(payload.userId);
    const maxImages = this.getMaxImages(userData.subscription);
    console.log(userData.images.length,  maxImages);
    

    if (userData.images.length >= maxImages) {
      throw new BadRequestException('Image upload limit reached');
    }

    return true;
  }

  getToken(headers) {
    if (!headers['authorization']) return null;
    const [type, token] = headers['authorization'].split(' ');
    return type === 'Bearer' ? token : null;
  }

  getMaxImages(subscription: 'free' | 'premium' | 'pro'): number {
    switch (subscription) {
      case 'premium':
        return 10;
      case 'pro':
        return 20;
      default:
        return 5;
    }
  }
}
