import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

/**
 * Utility class for handling security operations
 */
export class SecurityUtils {
  /**
   * Number of salt rounds for bcrypt
   */
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash a password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare a plain text password with a hash
   * @param plainPassword Plain text password
   * @param hashedPassword Hashed password to compare against
   * @returns True if passwords match
   */
  static async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Generate a secure random token
   * @param length Length of the token in bytes
   * @returns Random token string in hex format
   */
  static generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure API key
   * @returns API key with prefix
   */
  static generateApiKey(): string {
    const prefix = 'sk_';
    return prefix + this.generateSecureToken(24);
  }

  /**
   * Generate a random verification code for email/SMS
   * @param length Length of the verification code
   * @returns Numeric verification code
   */
  static generateVerificationCode(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }
}
