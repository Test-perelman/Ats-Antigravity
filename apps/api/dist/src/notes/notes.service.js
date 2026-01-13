"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const team_prisma_service_1 = require("../prisma/team-prisma.service");
let NotesService = class NotesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createNoteDto, userId) {
        return this.prisma.client.note.create({
            data: {
                ...createNoteDto,
                createdBy: userId,
            },
        });
    }
    async findAll(entityType, entityId) {
        const where = {};
        if (entityType)
            where.entityType = entityType;
        if (entityId)
            where.entityId = entityId;
        return this.prisma.client.note.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.client.note.findUnique({
            where: { id },
        });
    }
    async update(id, updateNoteDto) {
        return this.prisma.client.note.update({
            where: { id },
            data: updateNoteDto,
        });
    }
    async remove(id) {
        return this.prisma.client.note.delete({
            where: { id },
        });
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [team_prisma_service_1.TeamPrismaService])
], NotesService);
//# sourceMappingURL=notes.service.js.map