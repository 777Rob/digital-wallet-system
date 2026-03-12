import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Text,
  Anchor,
  Stack,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useWalletStore } from "../store/useWalletStore";
import { useLoginMutation } from "../hooks/mutations/useAuthMutations";
import { extractErrorMessage } from "../utils/errorMessage";
import { AppLogo } from "../components/common/AppLogo";
import { IconWallet } from "@tabler/icons-react";

export const Login = () => {
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { setBalance, setCurrency } = useWalletStore();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (val: string) =>
        /^\S+@\S+$/.test(val) ? null : t("invalidEmail"),
      password: (val: string) => (val.length < 6 ? t("required") : null),
    },
  });

  const mutation = useLoginMutation();

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: (data) => {
        setAuth(data.accessToken, { id: data.id, name: data.name });
        setBalance(data.balance);
        setCurrency(data.currency);
        navigate("/dashboard");
      },
      onError: (error) => {
        notifications.show({
          title: t("error"),
          message: extractErrorMessage(error, t("loginFailed")),
          color: "red",
        });
      },
    });
  });

  return (
    <Container size={420} w="100%">
      <Paper withBorder shadow="xl" p={40} radius="md">
        <Title ta="center" order={2} mt="md" mb="xl">
          {t("welcomeBack")}
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label={t("email")}
              placeholder={t("emailPlaceholder")}
              required
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label={t("password")}
              placeholder={t("passwordPlaceholder")}
              required
              {...form.getInputProps("password")}
            />
            <Button
              fullWidth
              mt="xl"
              type="submit"
              color="green"
              loading={mutation.isPending}
            >
              {t("login")}
            </Button>
          </Stack>
        </form>
        <Text c="dimmed" size="sm" ta="center" mt={20}>
          <Anchor component={Link} to="/register" size="sm" fw={500}>
            {t("noAccount")}
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};
