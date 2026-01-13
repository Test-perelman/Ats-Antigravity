import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class VendorsService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createVendorDto: CreateVendorDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateVendorDto: UpdateVendorDto): Promise<any>;
    remove(id: string): Promise<any>;
}
