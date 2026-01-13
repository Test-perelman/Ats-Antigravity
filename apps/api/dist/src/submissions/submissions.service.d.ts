import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class SubmissionsService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createSubmissionDto: CreateSubmissionDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSubmissionDto: UpdateSubmissionDto): Promise<any>;
    remove(id: string): Promise<any>;
}
