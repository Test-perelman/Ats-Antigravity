import { CreateImmigrationDto } from './dto/create-immigration.dto';
import { UpdateImmigrationDto } from './dto/update-immigration.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class ImmigrationService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createImmigrationDto: CreateImmigrationDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateImmigrationDto: UpdateImmigrationDto): Promise<any>;
    remove(id: string): Promise<any>;
}
