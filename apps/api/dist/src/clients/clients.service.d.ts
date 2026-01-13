import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class ClientsService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createClientDto: CreateClientDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateClientDto: UpdateClientDto): Promise<any>;
    remove(id: string): Promise<any>;
}
