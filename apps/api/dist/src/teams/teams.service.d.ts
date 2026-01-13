import { CreateTeamDto } from './dto/create-team.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class TeamsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTeamDto: CreateTeamDto, creatorId: string): Promise<any>;
    findAll(): Promise<any>;
    findMyTeams(userId: string): Promise<any>;
    findOne(id: string): Promise<any>;
    requestAccess(userId: string, teamId: string): Promise<any>;
    getRequests(teamId: string): Promise<any>;
    approveAccess(requestId: string, teamId: string): Promise<any>;
    rejectAccess(requestId: string): Promise<any>;
}
