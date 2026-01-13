import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(params: {
        teamId?: string;
        userId?: string;
        action: string;
        entity: string;
        entityId: string;
        details?: any;
    }): Promise<any>;
}
