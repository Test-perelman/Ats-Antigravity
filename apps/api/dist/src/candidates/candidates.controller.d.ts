import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
export declare class CandidatesController {
    private readonly candidatesService;
    constructor(candidatesService: CandidatesService);
    create(createCandidateDto: CreateCandidateDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateCandidateDto: UpdateCandidateDto): Promise<any>;
    remove(id: string): Promise<any>;
}
