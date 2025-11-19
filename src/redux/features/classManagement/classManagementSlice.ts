import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ClassFilters {
  code?: string;
  name?: string;
  isActive?: boolean;
}

interface StudentFilters {
  code?: string;
  name?: string;
  isActive?: boolean;
}

interface DeleteDialogState {
  isOpen: boolean;
  type: "class" | "student" | null;
  id: string | null;
  name: string | null;
}

interface ClassManagementState {
  // Class UI State
  classFilters: ClassFilters;
  selectedClassId: string | null;
  isClassFormOpen: boolean;
  isClassDetailOpen: boolean;
  classFormMode: "create" | "edit";
  isStudentAssignDialogOpen: boolean;

  // Student UI State
  studentFilters: StudentFilters;
  selectedStudentId: string | null;
  isStudentFormOpen: boolean;
  isStudentDetailOpen: boolean;
  studentFormMode: "create" | "edit";
  isStudentImportDialogOpen: boolean;

  // Delete Confirmation Dialog
  deleteDialog: DeleteDialogState;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: ClassManagementState = {
  // Class UI State
  classFilters: {},
  selectedClassId: null,
  isClassFormOpen: false,
  isClassDetailOpen: false,
  classFormMode: "create",
  isStudentAssignDialogOpen: false,

  // Student UI State
  studentFilters: {},
  selectedStudentId: null,
  isStudentFormOpen: false,
  isStudentDetailOpen: false,
  studentFormMode: "create",
  isStudentImportDialogOpen: false,

  // Delete Confirmation Dialog
  deleteDialog: {
    isOpen: false,
    type: null,
    id: null,
    name: null,
  },
};

// ============================================================================
// Slice
// ============================================================================

export const classManagementSlice = createSlice({
  name: "classManagement",
  initialState,
  reducers: {
    // ========================================================================
    // Class Actions
    // ========================================================================

    setClassFilters: (state, action: PayloadAction<ClassFilters>) => {
      state.classFilters = action.payload;
    },

    clearClassFilters: (state) => {
      state.classFilters = {};
    },

    setSelectedClassId: (state, action: PayloadAction<string | null>) => {
      state.selectedClassId = action.payload;
    },

    openClassForm: (state, action: PayloadAction<"create" | "edit">) => {
      state.isClassFormOpen = true;
      state.classFormMode = action.payload;
    },

    closeClassForm: (state) => {
      state.isClassFormOpen = false;
      state.selectedClassId = null;
    },

    openClassDetail: (state, action: PayloadAction<string>) => {
      state.isClassDetailOpen = true;
      state.selectedClassId = action.payload;
    },

    closeClassDetail: (state) => {
      state.isClassDetailOpen = false;
      state.selectedClassId = null;
    },

    openStudentAssignDialog: (state) => {
      state.isStudentAssignDialogOpen = true;
    },

    closeStudentAssignDialog: (state) => {
      state.isStudentAssignDialogOpen = false;
    },

    // ========================================================================
    // Student Actions
    // ========================================================================

    setStudentFilters: (state, action: PayloadAction<StudentFilters>) => {
      state.studentFilters = action.payload;
    },

    clearStudentFilters: (state) => {
      state.studentFilters = {};
    },

    setSelectedStudentId: (state, action: PayloadAction<string | null>) => {
      state.selectedStudentId = action.payload;
    },

    openStudentForm: (state, action: PayloadAction<"create" | "edit">) => {
      state.isStudentFormOpen = true;
      state.studentFormMode = action.payload;
    },

    closeStudentForm: (state) => {
      state.isStudentFormOpen = false;
      state.selectedStudentId = null;
    },

    openStudentDetail: (state, action: PayloadAction<string>) => {
      state.isStudentDetailOpen = true;
      state.selectedStudentId = action.payload;
    },

    closeStudentDetail: (state) => {
      state.isStudentDetailOpen = false;
      state.selectedStudentId = null;
    },

    openStudentImportDialog: (state) => {
      state.isStudentImportDialogOpen = true;
    },

    closeStudentImportDialog: (state) => {
      state.isStudentImportDialogOpen = false;
    },

    // ========================================================================
    // Delete Dialog Actions
    // ========================================================================

    openDeleteDialog: (
      state,
      action: PayloadAction<{ type: "class" | "student"; id: string; name: string }>,
    ) => {
      state.deleteDialog = {
        isOpen: true,
        type: action.payload.type,
        id: action.payload.id,
        name: action.payload.name,
      };
    },

    closeDeleteDialog: (state) => {
      state.deleteDialog = {
        isOpen: false,
        type: null,
        id: null,
        name: null,
      };
    },

    // ========================================================================
    // Reset Actions
    // ========================================================================

    resetClassState: (state) => {
      state.classFilters = {};
      state.selectedClassId = null;
      state.isClassFormOpen = false;
      state.isClassDetailOpen = false;
      state.classFormMode = "create";
      state.isStudentAssignDialogOpen = false;
    },

    resetStudentState: (state) => {
      state.studentFilters = {};
      state.selectedStudentId = null;
      state.isStudentFormOpen = false;
      state.isStudentDetailOpen = false;
      state.studentFormMode = "create";
      state.isStudentImportDialogOpen = false;
    },

    resetAllState: () => initialState,
  },
});

// ============================================================================
// Export Actions
// ============================================================================

export const {
  // Class Actions
  setClassFilters,
  clearClassFilters,
  setSelectedClassId,
  openClassForm,
  closeClassForm,
  openClassDetail,
  closeClassDetail,
  openStudentAssignDialog,
  closeStudentAssignDialog,

  // Student Actions
  setStudentFilters,
  clearStudentFilters,
  setSelectedStudentId,
  openStudentForm,
  closeStudentForm,
  openStudentDetail,
  closeStudentDetail,
  openStudentImportDialog,
  closeStudentImportDialog,

  // Delete Dialog Actions
  openDeleteDialog,
  closeDeleteDialog,

  // Reset Actions
  resetClassState,
  resetStudentState,
  resetAllState,
} = classManagementSlice.actions;

export default classManagementSlice.reducer;
