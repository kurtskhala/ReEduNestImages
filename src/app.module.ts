import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AwsS3Module } from './aws-s3/aws-s3.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL || ''),
    UsersModule,
    AuthModule,
    AwsS3Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
