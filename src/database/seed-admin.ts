
import 'reflect-metadata';
import 'dotenv/config';

import * as bcrypt from 'bcrypt';

import { AppDataSource } from './data-source.js';
import { User, UserRole } from '../users/entities/user.entity.js';

async function seedAdmin() {

    try {
        const fullName = process.env.ADMIN_NAME?.trim();
        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD;

        // Validate environment variables
        if (!fullName || !email || !password) {
            throw new Error(
                'ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required',
            );
        }

        if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
            throw new Error(
                'Admin password must be at least 8 characters and no more than 72 bytes',
            );
        }

        await AppDataSource.initialize();

        const userRepository = AppDataSource.getRepository(User);

        // Prevent creating multiple initial Admin accounts
        const existingAdmin = await userRepository.findOne({
            where: {
                role: UserRole.ADMIN,
            },
        });

        if (existingAdmin) {
            console.log('An Admin account already exists.');
            return;
        }

        // Prevent duplicate email
        const existingUser = await userRepository.findOne({
            where: { email },
        });

        if (existingUser) {
            throw new Error(
                'This email is already registered with another role.',
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Admin
        const admin = userRepository.create({
            fullName,
            email,
            password: hashedPassword,
            role: UserRole.ADMIN,
            isActive: true,
        });

        await userRepository.save(admin);

        console.log('Initial Admin account created successfully!');
        console.log('Admin Email:', email);

    } catch (error) {
        console.error('Admin seeding failed:', error);
        process.exitCode = 1;

    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seedAdmin();
