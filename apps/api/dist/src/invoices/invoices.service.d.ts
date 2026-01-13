import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class InvoicesService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createInvoiceDto: CreateInvoiceDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<any>;
    remove(id: string): Promise<any>;
}
