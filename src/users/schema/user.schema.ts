import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Subscription } from '../../enums/permission.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String, select: false })
  password: string;

  @Prop({ default: 'free' })
  subscription: 'free' | 'premium' | 'pro';

  @Prop({ type: [String], default: [] })
  images: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
