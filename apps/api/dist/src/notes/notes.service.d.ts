import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class NotesService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createNoteDto: CreateNoteDto, userId: string): Promise<any>;
    findAll(entityType?: string, entityId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateNoteDto: UpdateNoteDto): Promise<any>;
    remove(id: string): Promise<any>;
}
