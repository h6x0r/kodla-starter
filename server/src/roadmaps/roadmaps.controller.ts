import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { RoadmapsService } from "./roadmaps.service";
import {
  GenerateRoadmapVariantsDto,
  SelectRoadmapVariantDto,
} from "./dto/roadmaps.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("roadmaps")
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 30, ttl: 60000 } }) // Default: 30 requests per minute
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  /**
   * Get available roadmap templates
   * Public endpoint - no auth required
   */
  @Get("templates")
  async getTemplates() {
    return this.roadmapsService.getTemplates();
  }

  /**
   * Check if user can generate a roadmap
   * Returns generation status and limits
   */
  @UseGuards(JwtAuthGuard)
  @Get("can-generate")
  async canGenerateRoadmap(@Request() req) {
    return this.roadmapsService.canGenerateRoadmap(req.user.userId);
  }

  /**
   * Get user's current roadmap
   * Returns null if no roadmap exists
   */
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getMyRoadmap(@Request() req) {
    return this.roadmapsService.getUserRoadmap(req.user.userId);
  }

  /**
   * Delete user's roadmap (reset)
   */
  @UseGuards(JwtAuthGuard)
  @Delete("me")
  async deleteRoadmap(@Request() req) {
    return this.roadmapsService.deleteRoadmap(req.user.userId);
  }

  // ============================================================================
  // NEW: Extended Roadmap Generation (v2) - Variant-based
  // ============================================================================

  /**
   * Generate 3-5 roadmap variants based on user input
   * First generation is FREE, regeneration requires Premium
   * Returns multiple variants for user to choose from
   * Rate limited: 1 request per minute (AI-intensive operation)
   */
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 1, ttl: 60000 } }) // 1 request per minute - AI intensive
  @Post("generate-variants")
  async generateVariants(
    @Request() req,
    @Body() dto: GenerateRoadmapVariantsDto,
  ) {
    return this.roadmapsService.generateRoadmapVariants(req.user.userId, dto);
  }

  /**
   * Get user's saved variants (if any)
   * Returns variants that were generated but not yet selected
   */
  @UseGuards(JwtAuthGuard)
  @Get("variants")
  async getMyVariants(@Request() req) {
    return this.roadmapsService.getUserVariants(req.user.userId);
  }

  /**
   * Select a variant and create the roadmap from it
   * Saves the selected variant as the user's active roadmap
   */
  @UseGuards(JwtAuthGuard)
  @Post("select-variant")
  async selectVariant(@Request() req, @Body() dto: SelectRoadmapVariantDto) {
    return this.roadmapsService.selectRoadmapVariant(req.user.userId, dto);
  }
}
