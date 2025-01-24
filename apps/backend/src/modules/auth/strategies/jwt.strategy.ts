import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '../../../exceptions/bad.request.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('OAUTH_KEY'),
    });
  }

  async validate(payload: any): Promise<any> {
    if (
      !('azp' in payload) ||
      !('preferred_username' in payload) ||
      !('realm_access' in payload) ||
      !('roles' in payload.realm_access) ||
      !(
        Object.prototype.toString.call(payload?.realm_access?.roles) ===
        '[object Array]'
      )
    ) {
      throw new BadRequestException('Invalid JWT');
    }

    return {
      user: payload.preferred_username,
      roles: payload.realm_access.roles,
    };
  }
}
