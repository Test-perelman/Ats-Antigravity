import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    create(createNoteDto: CreateNoteDto, req: any): Promise<any>;
    findAll(entityType?: string, entityId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateNoteDto: UpdateNoteDto): Promise<any>;
    remove(id: string): Promise<any>;
}
