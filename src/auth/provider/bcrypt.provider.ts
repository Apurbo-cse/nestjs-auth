import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashingProvider } from './hashing.provider';

@Injectable()
export class BcryptProvider implements HashingProvider {
    public async hashPassword(data: string | Buffer): Promise<string> {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(data, salt); // ✅ correct
    }

    public async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword); // ✅ correct
    }
}
