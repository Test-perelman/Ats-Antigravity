import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { TeamPrismaService } from '../prisma/team-prisma.service';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: TeamPrismaService);
    create(createProjectDto: CreateProjectDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<any>;
    remove(id: string): Promise<any>;
}
