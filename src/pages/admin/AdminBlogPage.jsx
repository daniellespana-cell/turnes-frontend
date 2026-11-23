import React from 'react';
import { useAdminBlog } from '../../hooks/admin/useAdminBlog';
import { AdminBlogList } from '../../components/admin/blog/AdminBlogList';
import { AdminBlogEditor } from '../../components/admin/blog/AdminBlogEditor';

/**
 * 📰 AdminBlogPage
 * Vista de administración para redactores y equipo de marketing de Turnes.
 * Orquesta la lista de artículos y el editor visual sin deuda técnica.
 */
const AdminBlogPage = () => {
  const {
    posts,
    loading,
    saving,
    uploading,
    activePost,
    isEditing,
    startNewPost,
    startEditPost,
    cancelEdit,
    updateField,
    handleCoverUpload,
    addSection,
    updateSectionTitle,
    updateParagraph,
    addParagraphToSection,
    removeParagraphFromSection,
    toggleCallout,
    updateCallout,
    removeSection,
    savePost,
    deletePost
  } = useAdminBlog();

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto font-manrope">
      {isEditing ? (
        <AdminBlogEditor
          post={activePost}
          saving={saving}
          uploading={uploading}
          onUpdateField={updateField}
          onCoverUpload={handleCoverUpload}
          onAddSection={addSection}
          onUpdateSectionTitle={updateSectionTitle}
          onUpdateParagraph={updateParagraph}
          onAddParagraph={addParagraphToSection}
          onRemoveParagraph={removeParagraphFromSection}
          onToggleCallout={toggleCallout}
          onUpdateCallout={updateCallout}
          onRemoveSection={removeSection}
          onSave={savePost}
          onCancel={cancelEdit}
        />
      ) : (
        <AdminBlogList
          posts={posts}
          loading={loading}
          onNewPost={startNewPost}
          onEditPost={startEditPost}
          onDeletePost={deletePost}
        />
      )}
    </div>
  );
};

export default AdminBlogPage;
