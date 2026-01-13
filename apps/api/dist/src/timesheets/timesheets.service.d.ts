import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class TimesheetsService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createTimesheetDto: CreateTimesheetDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateTimesheetDto: UpdateTimesheetDto): Promise<any>;
    remove(id: string): Promise<any>;
}
