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
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const team_prisma_service_1 = require("../prisma/team-prisma.service");
let SubmissionsService = class SubmissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSubmissionDto) {
        return this.prisma.client.submission.create({
            data: {
                candidateId: createSubmissionDto.candidateId,
                jobRequirementId: createSubmissionDto.jobRequirementId,
                submittedRate: createSubmissionDto.submittedRate,
                status: createSubmissionDto.status || 'submitted',
            },
        });
    }
    async findAll() {
        return this.prisma.client.submission.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                candidate: true,
                jobRequirement: true,
            }
        });
    }
    async findOne(id) {
        return this.prisma.client.submission.findUnique({
            where: { id },
            include: {
                candidate: true,
                jobRequirement: true,
                interviews: true,
            }
        });
    }
    async update(id, updateSubmissionDto) {
        return this.prisma.client.submission.update({
            where: { id },
            data: updateSubmissionDto,
        });
    }
    async remove(id) {
        return this.prisma.client.submission.delete({
            where: { id },
        });
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [team_prisma_service_1.TeamPrismaService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map