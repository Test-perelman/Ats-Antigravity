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
exports.InterviewsService = void 0;
const common_1 = require("@nestjs/common");
const team_prisma_service_1 = require("../prisma/team-prisma.service");
let InterviewsService = class InterviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createInterviewDto) {
        return this.prisma.client.interview.create({
            data: {
                submissionId: createInterviewDto.submissionId,
                round: createInterviewDto.round || 'Round 1',
                scheduledAt: new Date(createInterviewDto.scheduledAt),
                mode: createInterviewDto.mode || 'video',
                interviewerName: createInterviewDto.interviewerName,
                status: 'scheduled',
            },
        });
    }
    async findAll() {
        return this.prisma.client.interview.findMany({
            orderBy: { scheduledAt: 'asc' },
            include: {
                submission: {
                    include: {
                        candidate: true,
                        jobRequirement: true
                    }
                }
            }
        });
    }
    async findOne(id) {
        return this.prisma.client.interview.findUnique({
            where: { id },
            include: {
                submission: {
                    include: {
                        candidate: true,
                        jobRequirement: true
                    }
                }
            }
        });
    }
    async update(id, updateInterviewDto) {
        return this.prisma.client.interview.update({
            where: { id },
            data: updateInterviewDto,
        });
    }
    async remove(id) {
        return this.prisma.client.interview.delete({
            where: { id },
        });
    }
};
exports.InterviewsService = InterviewsService;
exports.InterviewsService = InterviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [team_prisma_service_1.TeamPrismaService])
], InterviewsService);
//# sourceMappingURL=interviews.service.js.map