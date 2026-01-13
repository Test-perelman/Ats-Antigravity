import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class CandidatesService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createCandidateDto: CreateCandidateDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateCandidateDto: UpdateCandidateDto): Promise<any>;
    remove(id: string): Promise<any>;
}
