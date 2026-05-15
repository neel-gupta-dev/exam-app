# Implementation Plan: NEET Integration & JEE/NEET Co-existence

This plan outlines the steps to introduce NEET mock tests alongside the existing JEE content. Both sections will be available to all students via a dedicated UI filter, and we will implement NEET-specific scoring rules.

## Proposed Changes

### 1. Test Categorization & Discovery

#### [MODIFY] [TestSeriesPage.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestSeriesPage.jsx)
- Update `matchesCategory` to include a new case for `activeCategory === 'neet'`.
- Update filtering logic to prioritize the `test.category` field.

#### [MODIFY] [CategoryTabs.jsx](file:///d:/P/exam-app/client/test-dashboard/src/components/CategoryTabs.jsx)
- Add a new tab for "NEET" with a distinct color (emerald/green) to differentiate from JEE.

---

### 2. NEET Scoring Logic (Section B Support)
NEET Section B allows students to answer any **10 out of 15** questions per subject.

#### [MODIFY] [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js)
- Implement logic to detect NEET tests and apply attempt limits on "Section B" sections.
- Ensure only the first 10 answered questions in those sections contribute to the score.

#### [MODIFY] [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx)
- Display a counter for optional sections: "Answered: 8/10".
- Add a warning if a student tries to answer more than the allowed limit.

---

### 3. Admin & Content Management

#### [MODIFY] [TestManagement.jsx](file:///d:/P/exam-app/client/admin/src/pages/TestManagement.jsx)
- Add "NEET" to the category dropdown.
- Implement a "NEET Preset" to auto-generate standard sections (Physics, Chemistry, Botany, Zoology).
- Add a property to sections to mark them as "Optional" (with a configurable limit).

## Verification Plan

### Automated Tests
- **Scoring Unit Test**: Verify that providing 12 answers in a 10-limit NEET section only scores the first 10.
- **Filter Test**: Verify that selecting the "NEET" tab correctly filters tests.

### Manual Verification
- Create a dummy NEET test in Admin.
- Attempt the test as a student and verify the 10/15 limit in Section B.
