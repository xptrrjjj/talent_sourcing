import { nanoid } from 'nanoid';
import { createRecord, retrieveRecords } from './api/datastore';
import type { Pipeline, ApplicationStage, Candidate } from '../types';

export async function getPipelines(): Promise<Pipeline[]> {
  try {
    const records = await retrieveRecords({ type: 'pipeline' });
    return records
      .filter(record => record.data && !record.data.deleted)
      .map(record => ({
        ...record.data,
        id: record.record_id
      }));
  } catch (error) {
    console.error('Failed to fetch pipelines:', error);
    return [];
  }
}

export async function savePipeline(pipeline: Pipeline): Promise<void> {
  try {
    await createRecord(pipeline.id, {
      type: 'pipeline',
      data: {
        ...pipeline,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to save pipeline:', error);
    throw error;
  }
}

export async function addCandidate(
  pipelineId: string,
  stageId: string,
  candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    const candidate: Candidate = {
      ...candidateData,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await createRecord(`${pipelineId}-${stageId}-${candidate.id}`, {
      type: 'candidate',
      data: candidate
    });
  } catch (error) {
    console.error('Failed to add candidate:', error);
    throw error;
  }
}

export async function moveCandidate(
  candidateId: string,
  fromStageId: string,
  toStageId: string
): Promise<void> {
  try {
    await createRecord(candidateId, {
      type: 'candidate_move',
      data: {
        fromStageId,
        toStageId,
        movedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to move candidate:', error);
    throw error;
  }
}