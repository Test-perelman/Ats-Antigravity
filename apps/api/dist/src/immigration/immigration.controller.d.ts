import { ImmigrationService } from './immigration.service';
import { CreateImmigrationDto } from './dto/create-immigration.dto';
import { UpdateImmigrationDto } from './dto/update-immigration.dto';
export declare class ImmigrationController {
    private readonly immigrationService;
    constructor(immigrationService: ImmigrationService);
    create(createImmigrationDto: CreateImmigrationDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateImmigrationDto: UpdateImmigrationDto): Promise<any>;
    remove(id: string): Promise<any>;
}
