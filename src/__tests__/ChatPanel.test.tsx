import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { ChatPanel } from '../components/video/ChatPanel';
import { chatService } from '../services/chat';

jest.mock('../services/chat');

const mockedChat = chatService as jest.Mocked<typeof chatService>;

function renderWithProvider(ui: React.ReactElement) {
  return render(<AppProvider>{ui}</AppProvider>);
}

describe('ChatPanel', () => {
  const participants = [
    { id: '1', name: 'Alice', isMuted: false, isVideoOn: true },
    { id: '2', name: 'Bob', isMuted: false, isVideoOn: true },
  ];

  beforeEach(() => {
    mockedChat.sendMessage.mockClear();
    mockedChat.sendPrivateMessage.mockClear();
  });

  test('renders recipient dropdown', () => {
    renderWithProvider(<ChatPanel participants={participants} onClose={() => {}} />);
    const select = screen.getByLabelText('Recipient');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('');
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  test('sends private message when recipient selected', () => {
    renderWithProvider(<ChatPanel participants={participants} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Recipient'), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText('Type a message'), { target: { value: 'hi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(mockedChat.sendPrivateMessage).toHaveBeenCalled();
    expect(mockedChat.sendMessage).not.toHaveBeenCalled();
  });

  test('updates state on send', async () => {
    renderWithProvider(<ChatPanel participants={participants} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Type a message'), { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(mockedChat.sendMessage).toHaveBeenCalled();
    expect(await screen.findByText('hello')).toBeInTheDocument();
  });
});
