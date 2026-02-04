import { IsString, IsNotEmpty, IsArray, IsNumber, IsIn } from "class-validator";

/**
 * Phase data structure for DTO validation
 */
export interface RoadmapPhaseDto {
  id: string;
  title: string;
  description: string;
  colorTheme: string;
  order: number;
  steps: {
    id: string;
    title: string;
    type: "practice" | "video" | "project" | "reading";
    durationEstimate: string;
    deepLink: string;
    resourceType: "task" | "topic" | "module";
    relatedResourceId: string;
    status: "available" | "completed" | "locked";
  }[];
  progressPercentage: number;
}

export class GenerateRoadmapVariantsDto {
  // Step 1: Current knowledge
  @IsArray()
  @IsString({ each: true })
  knownLanguages: string[];

  @IsNumber()
  yearsOfExperience: number;

  // Step 2: Interests (multi-select)
  @IsArray()
  @IsString({ each: true })
  interests: string[];

  // Step 3: Goal
  @IsString()
  @IsIn(["first-job", "senior", "startup", "master-skill"])
  goal: string;

  // Step 4: Time commitment
  @IsNumber()
  hoursPerWeek: number;

  @IsNumber()
  targetMonths: number;
}

export class SelectRoadmapVariantDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  // Full variant data (sent from frontend after generation)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  totalTasks: number;

  @IsNumber()
  estimatedHours: number;

  @IsNumber()
  estimatedMonths: number;

  @IsString()
  targetRole: string;

  @IsString()
  @IsIn(["easy", "medium", "hard"])
  difficulty: string;

  // Phases JSON - will be parsed on backend
  phases: RoadmapPhaseDto[];
}
