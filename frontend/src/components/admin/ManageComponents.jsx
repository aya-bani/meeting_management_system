import ComponentRoomReports from './ComponentRoomReports';

function ManageComponents({ components, rooms, floors, onDeleteComponent }) {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Manage Components</h2>
        <p className="text-slate-600">View and manage all system components across rooms and floors</p>
      </div>
      <ComponentRoomReports
        components={components}
        rooms={rooms}
        floors={floors}
        onDeleteComponent={onDeleteComponent}
      />
    </div>
  );
}

export default ManageComponents;

