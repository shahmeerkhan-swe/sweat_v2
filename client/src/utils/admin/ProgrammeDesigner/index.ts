// dragUtils.ts
import { DropResult } from 'react-beautiful-dnd';
import {
  Programme,
  ModuleInstance,
} from '../../../types/admin/ProgrammeDesigner';

export function handleOnDragEnd(
  result: DropResult,
  programmes: Programme[],
  setProgrammes: (programmes: Programme[]) => void,
  moduleInstances: ModuleInstance[],
  setModuleInstances: (moduleInstances: ModuleInstance[]) => void,
) {
  if (!result.destination) return;

  const { source, destination } = result;
  const newProgrammes = Array.from(programmes);
  const newModuleInstances = Array.from(moduleInstances);

  if (source.droppableId === destination.droppableId) {
    const programme = newProgrammes.find((p) => p.id === source.droppableId);
    if (programme) {
      const newModuleInstanceIds = Array.from(programme.moduleInstanceIds);
      const [draggedModuleInstanceId] = newModuleInstanceIds.splice(
        source.index,
        1,
      );
      newModuleInstanceIds.splice(
        destination.index,
        0,
        draggedModuleInstanceId,
      );
      programme.moduleInstanceIds = newModuleInstanceIds;
    }
  } else {
    const sourceProgramme = newProgrammes.find(
      (p) => p.id === source.droppableId,
    );
    const destinationProgramme = newProgrammes.find(
      (p) => p.id === destination.droppableId,
    );
    if (sourceProgramme && destinationProgramme) {
      const [draggedModuleInstanceId] =
        sourceProgramme.moduleInstanceIds.splice(source.index, 1);
      destinationProgramme.moduleInstanceIds.splice(
        destination.index,
        0,
        draggedModuleInstanceId,
      );

      const draggedModuleInstance = newModuleInstances.find(
        (instance) => instance.id === draggedModuleInstanceId,
      );
      if (draggedModuleInstance) {
        draggedModuleInstance.programmeId = destinationProgramme.id;
      }
    }
  }

  setProgrammes(newProgrammes);
  setModuleInstances(newModuleInstances);
}

export const saveAllProgrammes = (programmeState: Programme[]) => {
  // Perform save logic for all programmes
  console.log('Saved all programmes:', programmeState);
};

export const handleSaveAllProgrammes = (
  programmeState: Programme[],
  event: React.MouseEvent<HTMLButtonElement>,
) => {
  event.preventDefault(); // Prevent default button behavior
  saveAllProgrammes(programmeState);
};
