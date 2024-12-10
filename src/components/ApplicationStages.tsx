import React from 'react';
import { Users, ChevronDown, Building2 } from 'lucide-react';
import type { ApplicationStage } from '../types';
import { clsx } from 'clsx';

interface Props {
  stages: ApplicationStage[];
}

export function ApplicationStages({ stages }: Props) {
  const totalApplicants = stages.reduce((sum, stage) => sum + stage.count, 0);

  // If no stages, show empty state
  if (!stages.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Application Pipeline</h2>
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-2" />
            <span className="text-lg font-medium">0 Total Applicants</span>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          No applications in pipeline yet
        </div>
      </div>
    );
  }

  // Group roles by client
  const clientGroups = stages[0]?.roles?.reduce((acc, role) => {
    if (!acc[role.client]) {
      acc[role.client] = new Set();
    }
    acc[role.client].add(role.title);
    return acc;
  }, {} as Record<string, Set<string>>) ?? {};

  const clients = Object.keys(clientGroups);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Application Pipeline</h2>
        <div className="flex items-center text-gray-600">
          <Users className="w-5 h-5 mr-2" />
          <span className="text-lg font-medium">{totalApplicants} Total Applicants</span>
        </div>
      </div>

      <div className="space-y-6">
        {clients.map((client, clientIndex) => (
          <div key={client} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 flex items-center border-b">
              <Building2 className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">{client}</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Role
                    </th>
                    {stages.map((stage, index) => (
                      <th
                        key={stage.stage}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {stage.stage}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from(clientGroups[client] || []).map((role, roleIndex) => (
                    <tr key={role} className={clsx(roleIndex % 2 === 0 && 'bg-gray-50')}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {role}
                      </td>
                      {stages.map((stage, stageIndex) => {
                        const roleData = stage.roles?.find(
                          r => r.client === client && r.title === role
                        );
                        const count = roleData?.count || 0;
                        const percentage = ((count / (stage.count || 1)) * 100).toFixed(1);
                        
                        return (
                          <td
                            key={stage.stage}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span>{count}</span>
                                  <span className="text-gray-400">{percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: `hsl(${(stageIndex * 360) / stages.length}, 70%, 50%)`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}