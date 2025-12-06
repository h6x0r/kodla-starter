
import { taskService } from '../../tasks/api/taskService';
import { RoadmapUI, RoadmapPhaseUI, RoadmapStepUI } from '../model/types';
import { roadmapRepository } from '../data/repository';

// Distinct modern gradients for phases
const PHASE_PALETTES = [
  'from-cyan-400 to-blue-500',      // 1. Blue/Cyan
  'from-emerald-400 to-green-500',  // 2. Green
  'from-orange-400 to-red-500',     // 3. Orange/Red
  'from-purple-400 to-indigo-500',  // 4. Purple
  'from-pink-400 to-rose-500',      // 5. Pink
  'from-amber-400 to-yellow-500',   // 6. Amber
  'from-teal-400 to-cyan-500',      // 7. Teal
  'from-fuchsia-400 to-purple-600', // 8. Fuchsia
];

export const roadmapService = {
  
  /**
   * Generates a fully hydrated UI Roadmap.
   * This simulates the Backend Logic:
   * 1. Check if user has an existing roadmap in DB.
   * 2. If not, create one from Template.
   * 3. Join with UserProgress (completed tasks) to determine status.
   */
  generateUserRoadmap: async (role: string, level: string, userId: string = 'guest'): Promise<RoadmapUI> => {
    // In a real backend, we would fetch: SELECT * FROM user_roadmaps WHERE user_id = ?
    const template = await roadmapRepository.getTemplate(role, level);
    
    // Fetch user progress (in real app: SELECT task_id FROM user_completed_tasks WHERE user_id = ?)
    const completedTaskIds = taskService.getCompletedTaskIds();

    let totalSteps = 0;
    let completedSteps = 0;

    const hydratedPhases: RoadmapPhaseUI[] = template.phases.map((phase, index) => {
      let phaseCompletedCount = 0;

      // Assign dynamic color based on index (cycles if more phases than palettes)
      const dynamicColor = PHASE_PALETTES[index % PHASE_PALETTES.length];

      const hydratedSteps: RoadmapStepUI[] = phase.steps.map(step => {
        totalSteps++;
        
        // Determine completion based on related resource
        let isCompleted = false;
        
        if (step.resourceType === 'task' && step.relatedResourceId) {
            // Strict sync: Is the specific task ID in the completed list?
            isCompleted = completedTaskIds.includes(step.relatedResourceId);
        } else if (step.resourceType === 'topic' && step.relatedResourceId) {
            // Logic for Topic: Considered complete if related tasks are done?
            // For now, we use a simple helper, but backend would run a COUNT query.
            isCompleted = taskService.isResourceCompleted(step.relatedResourceId, 'topic');
        }

        if (isCompleted) {
            completedSteps++;
            phaseCompletedCount++;
        }

        return {
          ...step,
          status: isCompleted ? 'completed' : 'available' 
        };
      });

      return {
        ...phase,
        colorTheme: dynamicColor, // Inject dynamic color
        steps: hydratedSteps,
        progressPercentage: phase.steps.length > 0 ? (phaseCompletedCount / phase.steps.length) * 100 : 0
      };
    });

    return {
      id: template.id, // This would be the user_roadmap UUID in real DB
      userId: userId,  // Associated User
      role: role,
      roleTitle: template.roleTitle,
      level: level,
      targetLevel: template.targetLevel,
      title: `${template.roleTitle} Roadmap`,
      phases: hydratedPhases,
      totalProgress: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};
