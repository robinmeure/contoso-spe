// Column-related interfaces
export interface IColumnDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  hidden: boolean;
  indexed: boolean;
  readOnly: boolean;
  required: boolean;
  text?: {
    allowMultipleLines: boolean;
    appendChangesToExistingText: boolean;
    linesForEditing: number;
    maxLength: number;
  };
  // Add other column types as needed
}

export interface IColumnCreateRequest {
  name: string;
  description?: string;
  enforceUniqueValues?: boolean;
  hidden?: boolean;
  indexed?: boolean;
  required?: boolean;
  displayName?: string;
  text?: {
    allowMultipleLines: boolean;
    appendChangesToExistingText: boolean;
    linesForEditing: number;
    maxLength: number;
  };
}