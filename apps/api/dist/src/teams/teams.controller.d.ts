import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    create(createTeamDto: CreateTeamDto, req: any): Promise<any>;
    findAll(): Promise<any>;
    findMyTeams(req: any): Promise<any>;
    join(id: string, req: any): Promise<any>;
    getRequests(id: string): Promise<any>;
    approveRequest(id: string, requestId: string): Promise<any>;
    rejectRequest(requestId: string): Promise<any>;
    findOne(id: string): Promise<any>;
}
