import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Star } from "lucide-react";

interface Skill {
  id: string;
  skillName: string;
  skillLevel: number | null;
  category: string | null;
  experiencePoints: number | null;
  lastUsedAt: Date | null;
}

interface SkillTreeProps {
  skills: Skill[];
  botId: string;
}

const SKILL_XP_THRESHOLDS: Record<number, number> = {
  0: 100,
  1: 250,
  2: 500,
  3: 1000,
  4: 2000,
  5: 4000,
  6: 8000,
  7: 16000,
  8: 32000,
  9: 64000,
};

const SKILL_CATEGORIES = {
  execution: { color: "bg-blue-500", label: "Execution" },
  communication: { color: "bg-green-500", label: "Communication" },
  analysis: { color: "bg-purple-500", label: "Analysis" },
  general: { color: "bg-gray-500", label: "General" },
  trading: { color: "bg-yellow-500", label: "Trading" },
};

export function SkillTree({ skills, botId }: SkillTreeProps) {
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getNextLevelXP = (level: number) => {
    return SKILL_XP_THRESHOLDS[level] || 100000;
  };

  const getProgressPercent = (xp: number, level: number) => {
    const nextLevelXP = getNextLevelXP(level);
    return (xp / nextLevelXP) * 100;
  };

  const isSkillUnlocked = (skill: Skill) => {
    return (skill.skillLevel || 0) > 0 || (skill.experiencePoints || 0) > 0;
  };

  return (
    <div className="space-y-6" data-testid="skill-tree">
      {/* Skill Tree Visualization */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Skill Progression Tree</h3>
        
        <svg className="w-full" height="400" viewBox="0 0 800 400">
          {/* Draw connections between skills */}
          <defs>
            <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>

          {/* Draw skill nodes */}
          {Object.entries(groupedSkills).map(([category, categorySkills], catIndex) => (
            <g key={category}>
              {categorySkills.map((skill, skillIndex) => {
                const x = 100 + catIndex * 150;
                const y = 50 + skillIndex * 80;
                const isUnlocked = isSkillUnlocked(skill);
                const level = skill.skillLevel || 0;
                
                // Draw connecting lines
                if (skillIndex > 0) {
                  <line
                    x1={x}
                    y1={y - 40}
                    x2={x}
                    y2={y - 10}
                    stroke="url(#skillGradient)"
                    strokeWidth="2"
                    strokeDasharray={isUnlocked ? "0" : "5,5"}
                  />
                }

                return (
                  <g key={skill.id} data-testid={`skill-node-${skill.id}`}>
                    {/* Skill circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={30}
                      fill={isUnlocked ? SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES]?.color.replace('bg-', '#') || '#6b7280' : '#374151'}
                      stroke={isUnlocked ? '#fbbf24' : '#4b5563'}
                      strokeWidth={level > 5 ? 3 : 2}
                      className="transition-all"
                    />
                    
                    {/* Lock/Unlock icon */}
                    {isUnlocked ? (
                      <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14">
                        ⭐
                      </text>
                    ) : (
                      <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14">
                        🔒
                      </text>
                    )}
                    
                    {/* Skill level badge */}
                    {level > 0 && (
                      <circle cx={x + 20} cy={y - 20} r={12} fill="#10b981" />
                    )}
                    {level > 0 && (
                      <text x={x + 20} y={y - 15} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                        {level}
                      </text>
                    )}
                    
                    {/* Skill name */}
                    <text 
                      x={x} 
                      y={y + 50} 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize="11"
                      className="font-medium"
                    >
                      {skill.skillName.substring(0, 12)}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Skill Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <Card key={category} data-testid={`category-${category}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES]?.color || 'bg-gray-500'}>
                  {SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES]?.label || category}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {categorySkills.length} skills
                </span>
              </div>

              <div className="space-y-3">
                {categorySkills.map((skill) => {
                  const level = skill.skillLevel || 0;
                  const xp = skill.experiencePoints || 0;
                  const nextLevelXP = getNextLevelXP(level);
                  const progressPercent = getProgressPercent(xp, level);
                  const isUnlocked = isSkillUnlocked(skill);

                  return (
                    <div key={skill.id} className="space-y-1" data-testid={`skill-${skill.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isUnlocked ? (
                            <Unlock className="w-4 h-4 text-green-500" data-testid={`icon-unlocked-${skill.id}`} />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" data-testid={`icon-locked-${skill.id}`} />
                          )}
                          <span className={`text-sm font-medium ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                            {skill.skillName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {level > 0 && (
                            <>
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs font-bold">Lv {level}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {isUnlocked && (
                        <>
                          <Progress value={progressPercent} className="h-2" data-testid={`progress-${skill.id}`} />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{xp} XP</span>
                            <span>{nextLevelXP} XP to next level</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skills Summary */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Skills Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{skills.length}</div>
              <div className="text-xs text-muted-foreground">Total Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {skills.filter(s => isSkillUnlocked(s)).length}
              </div>
              <div className="text-xs text-muted-foreground">Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {skills.reduce((sum, s) => sum + (s.experiencePoints || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {Math.round(skills.reduce((sum, s) => sum + (s.skillLevel || 0), 0) / (skills.length || 1))}
              </div>
              <div className="text-xs text-muted-foreground">Avg Level</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
