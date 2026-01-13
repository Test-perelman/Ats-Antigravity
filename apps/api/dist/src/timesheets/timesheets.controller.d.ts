import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
export declare class TimesheetsController {
    private readonly timesheetsService;
    constructor(timesheetsService: TimesheetsService);
    create(createTimesheetDto: CreateTimesheetDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateTimesheetDto: UpdateTimesheetDto): Promise<any>;
    remove(id: string): Promise<any>;
}
