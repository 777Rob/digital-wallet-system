import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Anchor, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';
import { useLoginMutation } from '../hooks/mutations/useAuthMutations';

export const Login = () => {
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { setBalance, setCurrency } = useWalletStore();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (val: string) => (/^\S+@\S+$/.test(val) ? null : t('invalidEmail')),
      password: (val: string) => (val.length < 6 ? t('required') : null),
    },
  });

  const mutation = useLoginMutation();

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: (data) => {
        setAuth(data.accessToken, { id: data.id, name: data.name });
        setBalance(data.balance);
        setCurrency(data.currency);
        navigate('/dashboard');
      },
      onError: (error: Error | AxiosError) => {
        let message = 'Login failed';
        if ('isAxiosError' in error && error.response?.data) {
          message = (error.response.data as any).message || message;
        }
        notifications.show({
          title: 'Error',
          message,
          color: 'red',
        });
      }
    });
  });

  return (
    <Container size={420} my={40}>
      <Title ta="center">{t('login')}</Title>
      
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label={t('email')}
              placeholder="hello@example.com"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label={t('password')}
              placeholder="Your password"
              required
              {...form.getInputProps('password')}
            />
            <Button fullWidth mt="xl" type="submit" loading={mutation.isPending}>
              {t('login')}
            </Button>
          </Stack>
        </form>
        <Text c="dimmed" size="sm" ta="center" mt={15}>
          <Anchor component={Link} to="/register" size="sm">
            {t('noAccount')}
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};
