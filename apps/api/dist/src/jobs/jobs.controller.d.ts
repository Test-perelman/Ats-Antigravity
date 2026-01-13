import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    create(createJobDto: CreateJobDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateJobDto: UpdateJobDto): Promise<any>;
    remove(id: string): Promise<any>;
}
