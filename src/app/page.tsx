"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Settings, Shuffle } from "lucide-react";

interface Person {
  name: string;
  isCouple: boolean;
  partner?: string;
}

interface Group {
  id: number;
  members: Person[];
}

export default function GroupSeparatorApp() {
  const [peopleInput, setPeopleInput] = useState("");
  const [numGroups, setNumGroups] = useState(2);
  const [groups, setGroups] = useState<Group[]>([]);
  const [parsedPeople, setParsedPeople] = useState<Person[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState<number | string>(3);
  const [balanceCouples, setBalanceCouples] = useState(true);

  const parsePeople = (input: string): Person[] => {
    const items = input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const people: Person[] = [];

    items.forEach((item) => {
      if (item.includes(" e ")) {
        const [person1, person2] = item.split(" e ").map((name) => name.trim());
        people.push({ name: person1, isCouple: true, partner: person2 });
        people.push({ name: person2, isCouple: true, partner: person1 });
      } else {
        people.push({ name: item, isCouple: false });
      }
    });

    return people;
  };

  const generateGroups = async () => {
    setIsGenerating(true);
    setGroups([]); // Limpar grupos anteriores

    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setCountdown("Pronto!");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const people = parsePeople(peopleInput);
    setParsedPeople(people);

    if (people.length === 0) {
      setIsGenerating(false);
      return;
    }

    const couples: Person[][] = [];
    const singles: Person[] = [];
    const processedNames = new Set<string>();

    people.forEach((person) => {
      if (person.isCouple && !processedNames.has(person.name)) {
        const partner = people.find((p) => p.name === person.partner);
        if (partner) {
          couples.push([person, partner]);
          processedNames.add(person.name);
          processedNames.add(partner.name);
        }
      } else if (!person.isCouple) {
        singles.push(person);
      }
    });

    const shuffledCouples = [...couples].sort(() => Math.random() - 0.5);
    const shuffledSingles = [...singles].sort(() => Math.random() - 0.5);

    const newGroups: Group[] = Array.from({ length: numGroups }, (_, i) => ({
      id: i + 1,
      members: [],
    }));

    let currentGroupIndex = 0;
    if (balanceCouples) {
      shuffledCouples.forEach((couple) => {
        newGroups[currentGroupIndex].members.push(...couple);
        currentGroupIndex = (currentGroupIndex + 1) % numGroups;
      });
    } else {
      shuffledCouples.forEach((couple) => {
        const randomIndex = Math.floor(Math.random() * numGroups);
        newGroups[randomIndex].members.push(...couple);
      });
    }

    currentGroupIndex = 0;
    shuffledSingles.forEach((single) => {
      newGroups[currentGroupIndex].members.push(single);
      currentGroupIndex = (currentGroupIndex + 1) % numGroups;
    });

    setGroups(newGroups);
    setIsGenerating(false);
  };

  const getTotalPeople = () => parsePeople(peopleInput).length;
  const getCouplesCount = () => {
    const people = parsePeople(peopleInput);
    return people.filter((p) => p.isCouple).length / 2;
  };
  const getSinglesCount = () => {
    const people = parsePeople(peopleInput);
    return people.filter((p) => !p.isCouple).length;
  };

  const getPeoplePerGroup = () => {
    const totalPeople = getTotalPeople();
    if (totalPeople === 0 || numGroups === 0) return 0;
    return Math.ceil(totalPeople / numGroups);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Gerador de Grupos
          </h1>
          <p className="text-muted-foreground">
            Organize pessoas em grupos de forma inteligente e balanceada
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Cadastro de Pessoas
                </CardTitle>
                <CardDescription>
                  Digite os nomes separados por vírgula. Para casais, use "e"
                  entre os nomes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="people">Lista de Pessoas</Label>
                  <Textarea
                    id="people"
                    placeholder="Ex: Lucas e Pâmela, Pedro, Fabio e Vanessa, Rodrigo"
                    value={peopleInput}
                    onChange={(e) => setPeopleInput(e.target.value)}
                    className="min-h-[100px] mt-2"
                  />
                </div>

                {peopleInput && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Total: {getTotalPeople()} pessoas</span>
                    <span>Casais: {getCouplesCount()}</span>
                    <span>Solteiros: {getSinglesCount()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações dos Grupos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="numGroups">Quantidade de Grupos</Label>
                  <Input
                    id="numGroups"
                    type="number"
                    min="1"
                    value={numGroups}
                    onChange={(e) => setNumGroups(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>

                {peopleInput && numGroups > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Aproximadamente <strong>{getPeoplePerGroup()}</strong>{" "}
                      pessoas por grupo
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="balanceCouples" className="text-base">
                      Balancear casais
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {balanceCouples
                        ? "Distribui os casais igualmente entre os grupos."
                        : "Casais serão sorteados aleatoriamente."}
                    </p>
                  </div>
                  <input
                    id="balanceCouples"
                    type="checkbox"
                    checked={balanceCouples}
                    onChange={(e) => setBalanceCouples(e.target.checked)}
                    className="h-5 w-5 rounded border border-input"
                  />
                </div>

                <Button
                  onClick={generateGroups}
                  className="w-full"
                  disabled={!peopleInput.trim() || isGenerating}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  {isGenerating ? "Gerando..." : "Gerar Grupos"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {isGenerating && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="text-6xl font-bold text-primary animate-pulse">
                      {countdown}
                    </div>
                    <p className="text-muted-foreground">
                      Organizando os grupos...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {groups.length > 0 && !isGenerating && (
              <Card>
                <CardHeader>
                  <CardTitle>Grupos Formados</CardTitle>
                  <CardDescription>
                    Distribuição aleatória seguindo as regras configuradas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {groups.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Grupo {group.id}</h3>
                        <Badge variant="secondary">
                          {group.members.length} pessoa
                          {group.members.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.members.map((person, index) => {
                          const isFirstInCouple =
                            person.isCouple &&
                            person.partner &&
                            group.members.findIndex(
                              (m) => m.name === person.partner
                            ) > index;

                          if (person.isCouple && person.partner) {
                            const partnerInGroup = group.members.find(
                              (m) => m.name === person.partner
                            );
                            if (partnerInGroup && isFirstInCouple) {
                              return (
                                <Badge
                                  key={index}
                                  variant="default"
                                  className="text-sm"
                                >
                                  {person.name} e {person.partner}
                                </Badge>
                              );
                            } else if (partnerInGroup) {
                              return null;
                            }
                          }

                          return (
                            <Badge
                              key={index}
                              variant={person.isCouple ? "default" : "outline"}
                              className="text-sm"
                            >
                              {person.name}
                            </Badge>
                          );
                        })}
                      </div>
                      {group.id < groups.length && (
                        <Separator className="mt-3" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {groups.length === 0 && peopleInput && !isGenerating && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>
                      Configure as opções e clique em "Gerar Grupos" para ver os
                      resultados
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
