export const getTrackingQuestions = async () => {
  await Promise.resolve();
  return [
    {
      id: '1234',
      groupId: '4321',
      title: 'How did you sleep?',
      priority: 0,
      type: 'number',
      createdAt: Date.now(),
      expiryDate: null,
      notes: true,
      value: {},
      settings: { type: 'star', default: null },
    },
    {
      id: 'a1234',
      groupId: '4321',
      title: 'How many hours did you sleep for?',
      priority: 0,
      type: 'number',
      createdAt: Date.now(),
      expiryDate: null,
      notes: false,
      value: {},
      settings: { type: 'number', default: null },
    },
  ];
};
