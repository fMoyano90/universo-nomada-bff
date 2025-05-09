import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBookingDatesNullable1746794481437 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Modificar columna start_date para permitir valores nulos
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "start_date" DROP NOT NULL`);
        
        // Modificar columna end_date para permitir valores nulos
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "end_date" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios: volver a hacer las columnas NOT NULL
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "start_date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "end_date" SET NOT NULL`);
    }

}
