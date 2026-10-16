import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request,Response } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res:Response, next: () => void) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException('Invalid API key');
    }
    next();
  }
}
