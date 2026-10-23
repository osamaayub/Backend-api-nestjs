import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service.js';
import { LoggerService } from './user.logger.js';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, LoggerService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete an existing user and return true', () => {
    const result = service.deleteUser(1);
    expect(result).toBe(true);
  });

  it('should return false when deleting a non-existent user', () => {
    const result = service.deleteUser(999);
    expect(result).toBe(false);
  });
});
