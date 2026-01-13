import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class JobsService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createJobDto: CreateJobDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateJobDto: UpdateJobDto): Promise<any>;
    remove(id: string): Promise<any>;
}
