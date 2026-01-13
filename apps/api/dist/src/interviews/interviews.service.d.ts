import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class InterviewsService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createInterviewDto: CreateInterviewDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateInterviewDto: UpdateInterviewDto): Promise<any>;
    remove(id: string): Promise<any>;
}
