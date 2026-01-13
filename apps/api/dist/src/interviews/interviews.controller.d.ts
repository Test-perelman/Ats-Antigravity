import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
export declare class InterviewsController {
    private readonly interviewsService;
    constructor(interviewsService: InterviewsService);
    create(createInterviewDto: CreateInterviewDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateInterviewDto: UpdateInterviewDto): Promise<any>;
    remove(id: string): Promise<any>;
}
