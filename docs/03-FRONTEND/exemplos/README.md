# 💡 Exemplos Práticos - Frontend

## O que você encontra aqui?

Esta pasta contém **exemplos de código** que você pode copiar e adaptar para suas necessidades. São como "receitas" prontas!

---

## 🔘 Exemplo 1: Botões

### Botão Simples

```tsx
import { Button } from "@/components/ui/button";

function MeuComponente() {
  const handleClick = () => {
    alert("Você clicou!");
  };

  return (
    <Button onClick={handleClick}>
      Clique Aqui
    </Button>
  );
}
```

### Botão com Ícone

```tsx
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit } from "lucide-react";

function BotoesComIcone() {
  return (
    <div className="flex gap-2">
      {/* Ícone à esquerda */}
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Adicionar
      </Button>

      {/* Ícone à direita */}
      <Button variant="secondary">
        Editar
        <Edit className="ml-2 h-4 w-4" />
      </Button>

      {/* Só ícone */}
      <Button variant="destructive" size="icon">
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Botão com Loading

```tsx
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function BotaoComLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await salvarDados(); // Sua função
    setIsLoading(false);
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Salvando...
        </>
      ) : (
        "Salvar"
      )}
    </Button>
  );
}
```

---

## 📋 Exemplo 2: Formulários

### Formulário Simples

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FormularioSimples() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Impede a página de recarregar
    console.log({ nome, email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite seu nome"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
        />
      </div>

      <Button type="submit">Enviar</Button>
    </form>
  );
}
```

### Formulário com Validação

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1️⃣ Define o esquema de validação
const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  pressao: z.number().min(1, "Pressão mínima é 1").max(10, "Pressão máxima é 10"),
});

type FormData = z.infer<typeof formSchema>;

// 2️⃣ Usa no componente
function FormularioComValidacao() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      pressao: 3,
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Dados válidos:", data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Nome</Label>
        <Input {...form.register("nome")} />
        {form.formState.errors.nome && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.nome.message}
          </p>
        )}
      </div>

      {/* ... outros campos ... */}

      <Button type="submit">Enviar</Button>
    </form>
  );
}
```

---

## 📊 Exemplo 3: Tabelas

### Tabela Simples

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const maquinas = [
  { id: "1", nome: "Trator 01", status: "Operacional", pressao: 3.2 },
  { id: "2", nome: "Trator 02", status: "Alerta", pressao: 2.1 },
  { id: "3", nome: "Trator 03", status: "Crítico", pressao: 1.5 },
];

function TabelaSimples() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Pressão (bar)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {maquinas.map((maquina) => (
          <TableRow key={maquina.id}>
            <TableCell>{maquina.nome}</TableCell>
            <TableCell>{maquina.status}</TableCell>
            <TableCell>{maquina.pressao}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## 🔔 Exemplo 4: Notificações (Toast)

### Mostrar Notificação

```tsx
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

function ExemploToast() {
  const { toast } = useToast();

  const mostrarSucesso = () => {
    toast({
      title: "Sucesso! ✅",
      description: "A máquina foi cadastrada com sucesso.",
    });
  };

  const mostrarErro = () => {
    toast({
      title: "Erro! ❌",
      description: "Não foi possível salvar. Tente novamente.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={mostrarSucesso}>Mostrar Sucesso</Button>
      <Button onClick={mostrarErro} variant="destructive">
        Mostrar Erro
      </Button>
    </div>
  );
}
```

---

## 📡 Exemplo 5: Buscar Dados do Servidor

### Com React Query (Recomendado)

```tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function ListaMaquinas() {
  // Busca os dados
  const { data: maquinas, isLoading, error } = useQuery({
    queryKey: ["maquinas"], // Identificador único
    queryFn: async () => {
      const { data, error } = await supabase
        .from("machines")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Enquanto carrega
  if (isLoading) {
    return <p>Carregando...</p>;
  }

  // Se deu erro
  if (error) {
    return <p>Erro ao carregar: {error.message}</p>;
  }

  // Dados carregados
  return (
    <ul>
      {maquinas?.map((maquina) => (
        <li key={maquina.id}>{maquina.name}</li>
      ))}
    </ul>
  );
}
```

---

## 🎨 Exemplo 6: Card de Status

### Card Colorido por Status

```tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface StatusCardProps {
  titulo: string;
  status: "ok" | "alerta" | "critico";
  descricao: string;
}

function StatusCard({ titulo, status, descricao }: StatusCardProps) {
  // Define cores e ícones baseado no status
  const config = {
    ok: {
      cor: "bg-green-50 border-green-200",
      badge: "success" as const,
      icone: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    alerta: {
      cor: "bg-yellow-50 border-yellow-200",
      badge: "warning" as const,
      icone: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    },
    critico: {
      cor: "bg-red-50 border-red-200",
      badge: "destructive" as const,
      icone: <XCircle className="h-5 w-5 text-red-500" />,
    },
  };

  const { cor, badge, icone } = config[status];

  return (
    <Card className={cor}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {icone}
          <h3 className="font-semibold">{titulo}</h3>
        </div>
        <Badge variant={badge}>{status.toUpperCase()}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{descricao}</p>
      </CardContent>
    </Card>
  );
}

// Uso
function Exemplo() {
  return (
    <div className="space-y-4">
      <StatusCard
        titulo="Trator 01"
        status="ok"
        descricao="Todos os pneus com pressão normal"
      />
      <StatusCard
        titulo="Trator 02"
        status="alerta"
        descricao="Pneu traseiro direito com pressão baixa"
      />
      <StatusCard
        titulo="Trator 03"
        status="critico"
        descricao="Pressão crítica - verificar imediatamente!"
      />
    </div>
  );
}
```

---

## 📈 Exemplo 7: Gráfico Simples

### Gráfico de Linha

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const dados = [
  { hora: "08:00", pressao: 3.2 },
  { hora: "10:00", pressao: 3.1 },
  { hora: "12:00", pressao: 2.9 },
  { hora: "14:00", pressao: 2.8 },
  { hora: "16:00", pressao: 2.5 },
  { hora: "18:00", pressao: 2.3 },
];

function GraficoPressao() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados}>
          <XAxis dataKey="hora" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="pressao" 
            stroke="#22c55e" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 🎯 Dicas de Uso

1. **Copie o código** que precisa
2. **Adapte** para sua necessidade
3. **Teste** no navegador
4. **Pergunte** se tiver dúvidas!

---

## 📚 Mais Exemplos

Para mais exemplos, consulte:
- [shadcn/ui Docs](https://ui.shadcn.com) - Todos os componentes
- [Recharts](https://recharts.org) - Gráficos
- [React Hook Form](https://react-hook-form.com) - Formulários
- [TanStack Query](https://tanstack.com/query) - Busca de dados
