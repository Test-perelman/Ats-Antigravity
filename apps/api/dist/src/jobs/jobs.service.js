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
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const team_prisma_service_1 = require("../prisma/team-prisma.service");
let JobsService = class JobsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createJobDto) {
        return this.prisma.client.jobRequirement.create({
            data: {
                title: createJobDto.title,
                location: createJobDto.location,
                minExperience: createJobDto.minExperience,
                maxRate: createJobDto.maxRate,
                description: createJobDto.description,
                visaRequirements: createJobDto.visaRequirements,
                status: createJobDto.status || 'open',
            },
        });
    }
    async findAll() {
        return this.prisma.client.jobRequirement.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { submissions: true }
                }
            }
        });
    }
    async findOne(id) {
        return this.prisma.client.jobRequirement.findUnique({
            where: { id },
            include: {
                submissions: {
                    include: {
                        candidate: true
                    }
                }
            }
        });
    }
    async update(id, updateJobDto) {
        return this.prisma.client.jobRequirement.update({
            where: { id },
            data: updateJobDto,
        });
    }
    async remove(id) {
        return this.prisma.client.jobRequirement.delete({
            where: { id },
        });
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [team_prisma_service_1.TeamPrismaService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map