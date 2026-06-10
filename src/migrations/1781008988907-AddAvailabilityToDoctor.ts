import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailabilityToDoctor1781008988907 implements MigrationInterface {
    name = 'AddAvailabilityToDoctor1781008988907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" ADD "isAvailable" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "isAvailable"`);
    }

}
